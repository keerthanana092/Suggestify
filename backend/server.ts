import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const prisma = new PrismaClient();
const ai = new GoogleGenAI({});

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Helpers
const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
const isValidPassword = (pwd: string) => 
  pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
  if (!isValidPassword(password)) return res.status(400).json({ error: "Password must be 8+ chars, with upper, lower, number, and special char" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  res.status(201).json({ message: "User created successfully" });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  // Token valid for 30 days if rememberMe, else 1 day (or session cookie)
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '1d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // undefined = session cookie
  });

  res.json({ message: "Logged in successfully", user: { email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, preferences: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid session" });
  }
});

// Middleware for protected routes
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// User Profile & Settings
app.patch('/api/user/profile', authenticate, async (req: any, res) => {
  const { name } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { name },
    select: { id: true, email: true, name: true }
  });
  res.json(user);
});

app.patch('/api/user/password', authenticate, async (req: any, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!isValidPassword(newPassword)) return res.status(400).json({ error: "New password is too weak" });

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { passwordHash }
  });
  res.json({ message: "Password updated successfully" });
});

app.delete('/api/user', authenticate, async (req: any, res) => {
  await prisma.user.delete({ where: { id: req.user.userId } });
  res.clearCookie('token');
  res.json({ message: "Account deleted" });
});

// History & Favorites
app.get('/api/user/history', authenticate, async (req: any, res) => {
  const history = await prisma.searchHistory.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json(history);
});

app.post('/api/user/favorites', authenticate, async (req: any, res) => {
  const { title, type } = req.body;
  const favorite = await prisma.favorite.create({
    data: { title, type, userId: req.user.userId }
  });
  res.json(favorite);
});

app.get('/api/user/favorites', authenticate, async (req: any, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(favorites);
});

app.delete('/api/user/favorites/:id', authenticate, async (req: any, res) => {
  await prisma.favorite.delete({
    where: { id: req.params.id, userId: req.user.userId }
  });
  res.json({ message: "Removed from favorites" });
});


app.post('/api/discover', async (req, res) => {
  try {
    const { query, category } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        introductoryMessage: { type: Type.STRING },
        mainMatch: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            vibeWords: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            whyItMatches: { type: Type.STRING },
          },
          required: ["title", "type", "vibeWords", "description", "whyItMatches"],
        },
        similarItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              isUnderrrated: { type: Type.BOOLEAN },
            },
            required: ["title", "type", "description", "isUnderrrated"],
          },
        },
      },
      required: ["introductoryMessage", "mainMatch", "similarItems"],
    };

    let systemInstruction = `You are the "Vibe Engine", a world-class, highly personalized discovery AI. You have global knowledge of all media, entertainment, and education. 
When a user provides a search query, you must follow this exact system:
1. UNDERSTAND THE VIBE.
2. FIND THE ONE BEST MATCH.
3. BE HUMAN: Start with a natural, conversational hook. 
4. HIGHLIGHT THE MAIN ITEM.
5. EXPAND THE HORIZON (8 SIMILAR ITEMS).
6. NO ROBOT SPEAK.

CRITICAL: You MUST return your response as a RAW JSON object matching this exact structure, with no markdown formatting or backticks around it:
{
  "introductoryMessage": "...",
  "mainMatch": { "title": "...", "type": "...", "vibeWords": ["..."], "description": "...", "whyItMatches": "..." },
  "similarItems": [ { "title": "...", "type": "...", "description": "...", "isUnderrrated": true } ]
}`;

    if (category && category !== 'all') {
      systemInstruction += `\n\nCRITICAL RESTRICTION: The user is specifically searching in the category: ${category.toUpperCase()}. ALL recommendations MUST strictly be ${category}. Do not recommend items from outside this category.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    let resultText = response.text;
    if (!resultText) {
      throw new Error("No response returned from Gemini");
    }

    // Robust JSON extraction: find the first { and last }
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Gemini response did not contain valid JSON structure");
    }

    resultText = resultText.substring(firstBrace, lastBrace + 1);

    const data = JSON.parse(resultText);

    try {
      let userId = null;
      const token = req.cookies.token;
      if (token) {
        try {
          const payload: any = jwt.verify(token, JWT_SECRET);
          userId = payload.userId;
        } catch (e) {}
      }

      await prisma.searchHistory.create({
        data: {
          query: query,
          introductoryMessage: data.introductoryMessage,
          mainMatchTitle: data.mainMatch.title,
          mainMatchType: data.mainMatch.type,
          mainMatchDescription: data.mainMatch.description,
          mainMatchReason: data.mainMatch.whyItMatches,
          userId: userId,
        }
      });
    } catch (dbError) {
      console.error("Failed to save search history:", dbError);
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error generating discovery:', error);
    return res.status(500).json({ error: 'Failed to generate vibe matches.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
