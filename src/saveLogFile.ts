import dateFormat from "date-format";

export async function saveLogFile(
  content: string,
  extension: string,
  provider = "",
  model = ""
) {
  const dateString = dateFormat.asString("yyyymmddThhmmss", new Date());
  const saveFileName = [dateString, provider, model].filter(Boolean).join("_");
  const file = Bun.file(`patches/${saveFileName}.${extension}`);
  return file.write(content);
}
