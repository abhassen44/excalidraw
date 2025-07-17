import express from 'express';
import jwt from 'jsonwebtoken';


import { JWT_SECRET } from '@repo/backend-common/config';


export default function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // In case format is "Bearer <token>"

  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    // @ts-ignore
    req.userId = decoded.userId;
    next(); // Allow request to proceed
    
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
