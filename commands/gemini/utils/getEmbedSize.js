export function getEmbedSize(embed) {
  let size = 0;
  // EmbedBuilder stores data in .data
  const data = embed.data;
  if (!data) return 0;

  if (data.title) size += data.title.length;
  if (data.description) size += data.description.length;
  if (data.footer?.text) size += data.footer.text.length;
  if (data.author?.name) size += data.author.name.length;
  if (data.fields) {
    for (const field of data.fields) {
      size += (field.name?.length || 0) + (field.value?.length || 0);
    }
  }
  return size;
}