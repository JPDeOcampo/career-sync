export const prepareDelete = (
  existingIds: string[],
  incomingIds: (string | undefined)[],
) =>
  existingIds.filter((id) => !incomingIds.includes(id)).map((id) => ({ id }));

// Prepare items to upsert
export const prepareUpsert = <
  T extends { id?: string },
  CreateInput,
  UpdateInput,
>(
  items: T[],
  createFn: (item: T) => CreateInput,
  updateFn: (item: T) => UpdateInput,
): Array<{ where: { id: string }; create: CreateInput; update: UpdateInput }> =>
  items.map((item) => ({
    where: { id: item.id ?? "" },
    create: createFn(item),
    update: updateFn(item),
  }));
