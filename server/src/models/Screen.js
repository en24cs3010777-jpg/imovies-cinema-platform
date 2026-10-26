const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide screen name'],
      trim: true
    },
    screenType: {
      type: String,
      enum: ['IMAX', 'Dolby Atmos', 'Standard 2D', 'RealD 3D', '4DX'],
      default: 'Standard 2D'
    },
    totalSeats: {
      type: Number,
      default: 64
    },
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    },
    columnsPerRow: {
      type: Number,
      default: 8
    },
    tierConfiguration: {
      vipRows: { type: [String], default: ['A', 'B'] },
      premiumRows: { type: [String], default: ['C', 'D', 'E'] },
      standardRows: { type: [String], default: ['F', 'G', 'H'] }
    },
    pricing: {
      vip: { type: Number, default: 18 },
      premium: { type: Number, default: 14 },
      standard: { type: Number, default: 10 }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const MongooseScreen = mongoose.model('Screen', screenSchema);
const memoryModels = require('../utils/inMemoryStore');

const ScreenProxy = new Proxy(MongooseScreen, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    const mem = memoryModels.Screen;
    if (prop in mem) {
      const val = mem[prop];
      return typeof val === 'function' ? val.bind(mem) : val;
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = ScreenProxy;
