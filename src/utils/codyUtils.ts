export const getCodyPosition = (category: string, name: string) => {
  switch (category) {
    case "상의":
      return "top"
    case "아우터":
      return "outer"
    case "하의":
      return "bottom"
    case "신발":
      return "shoes"
    case "가방":
      return "bag"
    case "패션소품":
      if (name.includes("모자") || name.includes("캡") || name.includes("햇")) {
        return "hat"
      } else if (name.includes("반지")) {
        return "ring"
      } else if (name.includes("팔찌")) {
        return "bracelet"
      } else {
        return "accessory"
      }
    default:
      return "accessory"
  }
} 