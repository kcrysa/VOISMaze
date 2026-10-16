/** All tunable maze constants — modify here to adjust difficulty and aesthetics */
export const MAZE_ROWS = 11;
export const MAZE_COLS = 15;
/** Minimum number of cells in any dead-end branch to ensure challenge */
export const MIN_BRANCH_LENGTH = 10;
/** Fraction of dead-end cells that receive a coffee decoration (0–1) */
export const COFFEE_DECORATION_RATIO = 0.3;
/** Max Manhattan distance from center cell for destination placement */
export const DESTINATION_RADIUS = 10;
/** Cell size in SVG units */
export const CELL_SIZE = 120;
/** Wall stroke width in SVG units */
export const WALL_STROKE = 20;
