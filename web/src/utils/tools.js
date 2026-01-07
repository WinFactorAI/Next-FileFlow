export function byteFormatter(value) {
  let size = value;
  if (!size)
    return "";
  let num = 1024.00
  if (size < num)
    return size + "B";
  if (size < Math.pow(num, 2))
    return (size / num).toFixed(2) + "KB";
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + "MB";
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + "GB";
  return (size / Math.pow(num, 4)).toFixed(2) + "TB";
}
