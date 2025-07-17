import express from 'express';
import jwt from 'jsonwebtoken';
import { CreateUserSchema , SigninSchema, CreateRoomSchema } from "@repo/common/types";

import authMiddleware from './AuthMiddleware';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/client';
import cors from 'cors';



const app = express();
const PORT = process.env.PORT || 3001;



app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello, Excalidraw HTTP Server!');
});


app.post("/signup",async(req :any , res :any) => {
  const safeUser = CreateUserSchema.safeParse(req.body);
  if (!safeUser.success) {
    return res.status(400).json({ error: safeUser.error.message });
  }
  const {username,  password ,name } = safeUser.data;

   if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  //check in database if user already exists
  const user = await prismaClient.users.findUnique({
    where: { email : username }
  })

  //if exists, return error
  if (user) {
    return res.status(400).json({ error: 'User already exists' });
  }
   
  //if not, create user in database and return success message
  const newUser = await prismaClient.users.create({
    data: {
      email: username,
      password: password,
      name: name,
      photo: null, // Assuming photo is optional and can be null
    }
  });

  //send jwt token
  const token = jwt.sign({ username }, JWT_SECRET);
  res.status(200).json({ message: 'User created successfully', token });
});

app.post("/signin", async (req: any, res: any) => {
  const safeUser = SigninSchema.safeParse(req.body);
  if (!safeUser.success) {
    return res.status(400).json({ error: safeUser.error.message });
  }

  const { username, password } = safeUser.data;

  // Find user by email only (Prisma `findUnique` only allows unique fields)
  const user = await prismaClient.users.findUnique({
    where: { email: username }
  });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Sign JWT token (include userId and email)
  const token = jwt.sign({ userId: user.id, username: user.email }, JWT_SECRET);

  res.status(200).json({ token, message: 'User signed in successfully' });
});



app.post("/room",authMiddleware, async(req :any , res :any) => {
  const safeRoom = CreateRoomSchema.safeParse(req.body);
  if (!safeRoom.success) {
    return res.status(400).json({ error: safeRoom.error.message });
  }
  const userId = req.userId; // Assuming authMiddleware sets req.userId
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    //check if room already exists in database
   const room = await prismaClient.room.create({
      data: {
        slug: safeRoom.data.name,
        adminId: userId, 
      }
    });

    res.status(200).json({ roomId : room.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create room' });
  }
}); 


// app.get("/chats ", authMiddleware, async (req: any, res: any) => {
//   const userId = req.userId; // Assuming authMiddleware sets req.userId
//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   // Fetch chats for the user from the database
//   const chats = await prismaClient.chat.findMany({
//     where: { userId: userId },
//     include: { room: true } // Include room details if needed
//   });

//   res.status(200).json(chats);


// });

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;

        const room = await prismaClient.room.findFirst({
            where: { slug : slug },
            orderBy: { id: "desc" },
        });

        if (!room) {
           res.status(404).json({ error: "Room not found" });
           return;
        }

        res.json({ room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch room" });
    }
})


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});