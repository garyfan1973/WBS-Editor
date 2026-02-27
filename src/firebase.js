import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBj2Y3OqF_3v7XbQp7lCDv9Bz0qVx0mHkI",
  authDomain: "taskflow-b8e7d.firebaseapp.com",
  databaseURL: "https://taskflow-b8e7d-default-rtdb.firebaseio.com",
  projectId: "taskflow-b8e7d",
  storageBucket: "taskflow-b8e7d.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// 房間密碼（與 TaskTracker 相同）
export const ROOM_PASSWORD = "gary1973";

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
