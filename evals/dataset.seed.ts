import 'dotenv/config';
import { LangfuseClient } from '@langfuse/client';
import { supportAgentDataset } from './datasets/support-agent.dataset';

const datasetName = 'support-agent';

const client = new LangfuseClient();

async function seedDataset() {
  await client.api.datasets.create({
    name: datasetName,
    description: 'Support agent dataset',
  });
  for (const item of supportAgentDataset) {
    await client.dataset.createItem({
      datasetName,
      ...item,
    });
  }
}

seedDataset();
