export async function getConfigServer(schema){
  try {
    return await schema.find({ isActive: true }).lean();
  } catch (err) {
    console.error("getConfigServer error:", err);
    return [];
  }
}