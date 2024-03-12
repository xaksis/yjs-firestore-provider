/**
 * Map a string to one of 20 visually distinct colors.
 *
 * This function is especially useful when trying to choose the cursor color
 * for a user. Simply pass the user's name (or some other identifier), and this
 * function maps the name to a color selected from a list of 20 visually distinct
 * colors.
 * @param name An arbitrary string
 * @returns One of 20 visually distinct colors in hex format.
 */
export declare function getColor(name: string): string;
