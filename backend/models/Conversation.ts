import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  type: { type: String, enum: ['direct', 'group'], default: 'direct' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupName: { type: String },
  lastMessageTime: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);