import { z } from 'zod';

/**
 * Response shapes for restful-booker. A renamed field or a changed type will
 * fail these checks even when the endpoint still answers with 200.
 */
export const BookingDatesSchema = z.object({
  checkin: z.string().min(1),
  checkout: z.string().min(1),
});

export const BookingSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const BookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(
  z.object({
    bookingid: z.number().int().positive(),
  }),
);

export const AuthTokenSchema = z.object({
  token: z.string().min(1),
});

export const ErrorResponseSchema = z.object({
  reason: z.string().min(1),
});
