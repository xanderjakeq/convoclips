import type { z } from "zod";
import type { serverSchema, clipSchema, messageSchema } from "./z";

export type DC_Server = z.infer<typeof serverSchema> & {
	id: number;
};

export type Clip = z.infer<typeof clipSchema> & {
    id: number
}

export type Message = z.infer<typeof messageSchema>
