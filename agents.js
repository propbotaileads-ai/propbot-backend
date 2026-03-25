const { v4: uuidv4 } = require('uuid');

const agentsCache = {};

async function createAgent(agentData) {
  const agentId = uuidv4().split('-')[0];

  const agent = {
    agentId,
    agentName: agentData.agentName || 'Your Agent',
    botName: agentData.botName || (agentData.agentName + ' AI'),
    email: agentData.email || '',
    phone: agentData.phone || '',
    city: agentData.city || '',
    propertyTypes: agentData.propertyTypes || 'residential',
    priceRange: agentData.priceRange || 'all ranges',
    tone: agentData.tone || 'Friendly & Approachable',
    calendlyLink: agentData.calendlyLink || '',
    googleSheetId: agentData.googleSheetId || process.env.GOOGLE_SHEETS_ID,
    notificationEmail: agentData.notificationEmail || agentData.email,
    language: agentData.language || 'English',
    about: agentData.about || '',
    faqs: agentData.faqs || '',
    plan: agentData.plan || 'starter',
    active: true,
    createdAt: new Date().toISOString(),
    leads: [],
  };

  agentsCache[agentId] = agent;

  try {
    const db = require('./database');
    await db.saveAgent(agent);
    console.log('[DoorBot AI] Agent saved to MongoDB:', agentId);
  } catch (err) {
    console.log('[DoorBot AI] MongoDB skip, using memory:', err.message);
  }

  console.log('[DoorBot AI] Agent created:', agentId, agent.agentName);
  return agent;
}

async function getAgent(agentId) {
  if (agentsCache[agentId]) return agentsCache[agentId];

  try {
    const db = require('./database');
    const agent = await db.findAgent(agentId);
    if (agent) {
      agentsCache[agentId] = agent;
      return agent;
    }
  } catch (err) {
    console.log('[DoorBot AI] MongoDB read skip:', err.message);
  }

  return null;
}

async function updateAgent(agentId, updates) {
  const agent = await getAgent(agentId);
  if (!agent) return null;

  const updated = { ...agent, ...updates, updatedAt: new Date().toISOString() };
  agentsCache[agentId] = updated;

  try {
    const db = require('./database');
    await db.saveAgent(updated);
  } catch (err) {
    console.log('[DoorBot AI] MongoDB update skip:', err.message);
  }

  return updated;
}

async function getAllAgents() {
  try {
    const db = require('./database');
    return await db.findAllAgents();
  } catch (err) {
    return Object.values(agentsCache);
  }
}

async function deactivateAgent(agentId) {
  await updateAgent(agentId, { active: false });
  return true;
}

module.exports = { createAgent, getAgent, getAllAgents, updateAgent, deactivateAgent };
