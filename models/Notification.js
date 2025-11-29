import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  // The user who receives the notification
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // Optional link to navigate to on click (e.g., /requests/id)
  link: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Notification', notificationSchema);
