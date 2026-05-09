const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'AC Repair', 'Pest Control', 'Other'],
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: String, required: true }, // e.g. "2 hours"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
