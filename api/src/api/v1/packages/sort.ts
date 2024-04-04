import { type Request, type Response } from "express";

const DIMENSION_THRESHOLD_IN_CM_CUBIC = Math.pow(1000000, 3);
const DIMENSION_THRESHOLD_IN_CM = 150;
const MASS_THRESHOLD_IN_KG = 20;

/*
Sort the packages using the following criteria:

- A package is **bulky** if its volume (Width x Height x Length) is greater than or equal to 1,000,000 cm³ or when one of its dimensions is greater or equal to 150 cm.
- A package is **heavy** when its mass is greater or equal to 20 kg.

You must dispatch the packages in the following stacks:

- **STANDARD**: standard packages (those that are not bulky or heavy) can be handled normally.
- **SPECIAL**: packages that are either heavy or bulky can't be handled automatically.
- **REJECTED**: packages that are **both** heavy and bulky are rejected.
*/

/*
QUESTIONS FOR REVIEWER

- How do we handle dimensions and mass that surpass lets say 1 billion. Does it make sense for a package to weight 1b kg or have huge dimensions?


TODOS
- to bulletproof this we should probably allow the user of this function to:
    - specify the dimension unit they are working with and we can make that conversion to cm as needed
    - specify the unit of mass and make the conversion to kg as needed
    - don't rely on positional arguments to the sort function. Use named arguments instead. 
    - use an assestion testing library e.g chai

ASSUMPTIONS
- assumes we are always working with centimeters and kilograms
- assumed we are working with small dimensions and mass
- assumes we have constants thresholds. In a production setting, this could be configured at the customer level e.g. allowed bigger thresholds for customers on a premium tier
*/

const sort = (
  width: number,
  height: number,
  length: number,
  mass: number,
): string | never | undefined => {
  const dimensions = [height, width, length];

  // unlikely to get here but let's check either way
  if ([...dimensions, mass].some((e) => isNaN(Number(e)))) {
    throw new Error(
      `Only numbers allowed. Check dimension and mass. mass: ${mass}. dimensions: height: ${height}, width: ${width}, length: ${length}`,
    );
  }

  // no 0 or negative dimensions allowed
  if (dimensions.some((d) => d <= 0)) {
    throw new Error(
      `Dimesion must be greater than 0. dimensions: height: ${height}, width: ${width}, length: ${length}`,
    );
  }

  // no 0 or negative mass allowed
  if (mass <= 0) {
    throw new Error(`Mass must be greater than 0. mass: ${mass}`);
  }

  const volume = width * height * length;

  const anyDimensionGreaterThanThreshold = dimensions.some(
    (dim: number) => dim >= DIMENSION_THRESHOLD_IN_CM,
  );

  const isBulky =
    volume >= DIMENSION_THRESHOLD_IN_CM_CUBIC ||
    anyDimensionGreaterThanThreshold;

  const isHeavy = mass >= MASS_THRESHOLD_IN_KG;

  if (isBulky && isHeavy) {
    return "REJECTED";
  } else if (isBulky || isHeavy) {
    return "SPECIAL";
  } else if (!(isBulky || isHeavy)) {
    return "STANDARD";
  }

  return undefined;
};

type Package = {
  width: number;
  height: number;
  length: number;
  mass: number;
};

export default function (req: Request, res: Response) {
  console.info("Entering /api/v1/packages/sort", req.body);
  try {
    const { width, height, length, mass } = req.body;

    if ([width, height, length, mass].some(e => e === null || e === undefined || e === "" || e === 0)) {
        return res
            .status(422)
            .json({ error: "width, height, length, mass are required. Values must be a number" });
    }

    return res
        .status(200)
        .json({ sort_order: sort(width, height, length, mass)} );

  } catch (error: any) {
    return res
        .status(500)
        .json({  error: `Internal Server Error ${error.message}` });
  }
}
