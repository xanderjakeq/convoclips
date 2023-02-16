import { z } from "zod";
import { serverSchema, clipSchema } from "./z";

export type DC_Server = z.infer<typeof serverSchema> & {
	id: number;
};

export type Clip = z.infer<typeof clipSchema> & {
    id: number
}

