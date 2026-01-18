
const BASE_URL = "https://api.on-demand.io/chat/v1";
const MEDIA_BASE_URL = "https://api.on-demand.io/media/v1";

const DEFAULT_AGENT_IDS = ["agent-1712327325", "agent-1713962163"];
const ENDPOINT_ID = "predefined-xai-grok4.1-fast";

export const createOnDemandSession = async (userName: string, apiKey: string, agentIds: string[] = DEFAULT_AGENT_IDS) => {
  const safeName = (userName || 'user').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const externalUserId = `${safeName}-${Math.random().toString(36).substring(2, 9)}`;

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentIds: agentIds,
      externalUserId: externalUserId,
      contextMetadata: [
        { key: "userName", value: userName || "Candidate" },
        { key: "role", value: "Student" }
      ],
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Session Init Failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.data.id;
};

export const uploadMediaFile = async (
  file: File, 
  sessionId: string, 
  apiKey: string,
  agents: string[]
) => {
  const url = `${MEDIA_BASE_URL}/public/file/raw`;
  const formData = new FormData();

  formData.append('file', file);
  formData.append('sessionId', sessionId);
  formData.append('createdBy', 'AIREV');
  formData.append('updatedBy', 'AIREV');
  formData.append('name', file.name);
  formData.append('responseMode', 'sync');

  agents.forEach(agent => {
    formData.append('agents', agent);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': apiKey
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Media Upload Failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const queryOnDemand = async (
  sessionId: string, 
  query: string, 
  apiKey: string,
  modelConfigs: any,
  agentIds: string[] = DEFAULT_AGENT_IDS
) => {
  const body = {
    endpointId: ENDPOINT_ID,
    query: query,
    agentIds: agentIds,
    responseMode: "sync",
    reasoningMode: "grok-4-fast",
    modelConfigs: {
      temperature: 0.3,
      topP: 0.85,
      maxTokens: 900,
      ...modelConfigs,
    },
  };

  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/query`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Query Processing Failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.data.answer;
};
