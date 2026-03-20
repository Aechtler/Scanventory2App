export const ITEM_ID_PARAMETER = [
  {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  },
];
