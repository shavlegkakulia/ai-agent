import { Injectable } from '@nestjs/common';
import { CallbackHandler } from '@langfuse/langchain';

type LangfuseHandlerParams = NonNullable<
  ConstructorParameters<typeof CallbackHandler>[0]
>;

@Injectable()
export class LangfuseService {
  createHandler(params: LangfuseHandlerParams) {
    return new CallbackHandler({
      ...params,
    });
  }
}
