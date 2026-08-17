import type { Response } from "express";
import type { ApiKeyRequest } from "../../middleware/apiKey.js";
import { parseInput } from "../../utils/validation.js";
import type { EventService } from "./service.js";
import { ingestEventSchema } from "./validators.js";

export class EventController {
  constructor(private readonly eventService: EventService) {}

  ingest = async (req: ApiKeyRequest, res: Response): Promise<void> => {
    const event = await this.eventService.ingest(
      req.apiKeyContext,
      parseInput(ingestEventSchema, req.body),
    );

    res.status(202).json({
      accepted: true,
      eventId: event.id,
    });
  };
}
