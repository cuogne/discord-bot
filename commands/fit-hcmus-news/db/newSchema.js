import mongoose from "mongoose";

// luu config server => khi co tin moi thi gui cho cac channel nay
const userConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: String,
  channelName: String,
  guildName: String,
  setupBy: String,
  setupAt: String,
  isActive: Boolean,
  categories: [String],
});

const newsConfigSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  listNewsUrl: { type: [String], default: [] },
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
})


export const schema = mongoose.model("schema", userConfigSchema);
export const newsSchema = mongoose.model("newsSchema", newsConfigSchema);