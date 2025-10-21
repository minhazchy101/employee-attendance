import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default : ''
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  role: {
    type: String,
    enum: ['pending', 'employee', 'admin'],
    default: 'pending',
  },
  jobTitle: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   
}, {timestamps: true}
);

const User = mongoose.model('User' , UserSchema)

export default User ;
