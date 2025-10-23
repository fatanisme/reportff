import { z } from 'zod';

export const createDatabaseEndpoint = (queryFunction) => {
  return async () => {
    try {
      const result = await queryFunction();
      return Response.json({ success: true, data: result });
    } catch (error) {
      console.error('Database error:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  };
};

export const createParameterizedEndpoint = (validator, queryFunction) => {
  return async (req) => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams);

      const validatedParams = validator.parse(params);
      const result = await queryFunction(validatedParams);
      return Response.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: 'Invalid parameters', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Database error:', error);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  };
};



