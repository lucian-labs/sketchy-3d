import { Vector3 } from "three";
import { Vec3 } from "../types/common.js";

// maybe too smart
export const v3 = (v3?: Vec3 | number, y?: number, z?: number) => {
  if (typeof v3 === "number") return new Vector3(v3, y, z);
  if (v3) return new Vector3(...v3);
  return new Vector3();
};
