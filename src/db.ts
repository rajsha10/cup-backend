import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseKey);

let supabase: any = null;
if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("🟢 Connected to Supabase DB");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY is missing. Running in fallback/in-memory mode.");
}

// Fallback in-memory states to avoid crashes if credentials are not configured yet
let fallbackMatchState = {
  eventId: "WC2026-FIN",
  minute: 72,
  score: "Argentina 2 - 1 France",
  recentEvent: "NONE"
};

// Map tokenId -> Ticket
let fallbackTickets: Record<string, {
  tokenId: string;
  seat: number;
  ownerAddress: string;
  isCheckedIn: boolean;
  isVictoryEdition: boolean;
}> = {
  // Pre-seed demo ticket #1
  '1': {
    tokenId: '1',
    seat: 104,
    ownerAddress: '0xmockaddress',
    isCheckedIn: false,
    isVictoryEdition: false
  }
};

export interface MatchState {
  eventId: string;
  minute: number;
  score: string;
  recentEvent: string;
}

export interface TicketState {
  tokenId: string;
  seat: number;
  ownerAddress: string;
  isCheckedIn: boolean;
  isVictoryEdition: boolean;
}

// ── Match Functions ──────────────────────────────────────────────────────────

export async function getLiveMatchState(): Promise<MatchState> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('eventId', 'WC2026-FIN')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, seed it
          await updateLiveMatchState('WC2026-FIN', 'Argentina 2 - 1 France', 72, 'NONE');
          return { eventId: 'WC2026-FIN', score: 'Argentina 2 - 1 France', minute: 72, recentEvent: 'NONE' };
        }
        throw error;
      }
      return data as MatchState;
    } catch (err) {
      console.error("❌ Supabase getLiveMatchState error, using fallback:", err);
      return fallbackMatchState;
    }
  }
  return fallbackMatchState;
}

export async function updateLiveMatchState(
  eventId: string,
  score: string | undefined,
  minute: number | undefined,
  recentEvent: string | undefined
): Promise<MatchState> {
  const updates: any = { eventId };
  if (score !== undefined) updates.score = score;
  if (minute !== undefined) updates.minute = minute;
  if (recentEvent !== undefined) updates.recentEvent = recentEvent;

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;
      return data as MatchState;
    } catch (err) {
      console.error("❌ Supabase updateLiveMatchState error, updating fallback:", err);
    }
  }

  // Fallback update
  if (score !== undefined) fallbackMatchState.score = score;
  if (minute !== undefined) fallbackMatchState.minute = minute;
  if (recentEvent !== undefined) fallbackMatchState.recentEvent = recentEvent;
  if (eventId) fallbackMatchState.eventId = eventId;
  return fallbackMatchState;
}

// ── Ticket Functions ──────────────────────────────────────────────────────────

export async function getTicketByOwner(ownerAddress: string): Promise<TicketState | null> {
  const sanitizedAddr = ownerAddress.toLowerCase();
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('ownerAddress', sanitizedAddr)
        .maybeSingle();

      if (error) throw error;
      return data as TicketState;
    } catch (err) {
      console.error("❌ Supabase getTicketByOwner error, using fallback:", err);
    }
  }

  // Fallback lookup
  const match = Object.values(fallbackTickets).find(
    (t) => t.ownerAddress.toLowerCase() === sanitizedAddr
  );
  return match || null;
}

export async function saveTicket(
  tokenId: string,
  seat: number,
  ownerAddress: string
): Promise<TicketState> {
  const sanitizedAddr = ownerAddress.toLowerCase();
  const ticket: TicketState = {
    tokenId,
    seat,
    ownerAddress: sanitizedAddr,
    isCheckedIn: false,
    isVictoryEdition: false
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .upsert(ticket)
        .select()
        .single();

      if (error) throw error;
      return data as TicketState;
    } catch (err) {
      console.error("❌ Supabase saveTicket error, saving to fallback:", err);
    }
  }

  fallbackTickets[tokenId] = ticket;
  return ticket;
}

export async function updateTicketCheckIn(tokenId: string, isCheckedIn: boolean): Promise<TicketState | null> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ isCheckedIn })
        .eq('tokenId', tokenId)
        .select()
        .single();

      if (error) throw error;
      return data as TicketState;
    } catch (err) {
      console.error("❌ Supabase updateTicketCheckIn error, updating fallback:", err);
    }
  }

  const t = fallbackTickets[tokenId];
  if (t) {
    t.isCheckedIn = isCheckedIn;
    return t;
  }
  return null;
}

export async function upgradeTicketToVictory(tokenId: string): Promise<TicketState | null> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ isVictoryEdition: true })
        .eq('tokenId', tokenId)
        .select()
        .single();

      if (error) throw error;
      return data as TicketState;
    } catch (err) {
      console.error("❌ Supabase upgradeTicketToVictory error, updating fallback:", err);
    }
  }

  const t = fallbackTickets[tokenId];
  if (t) {
    t.isVictoryEdition = true;
    return t;
  }
  return null;
}

export async function upgradeAllTicketsToVictory(eventId: string): Promise<number> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ isVictoryEdition: true })
        .select('*');

      if (error) throw error;
      return data ? data.length : 0;
    } catch (err) {
      console.error("❌ Supabase upgradeAllTicketsToVictory error, updating fallback:", err);
    }
  }

  // Fallback update
  let count = 0;
  for (const t of Object.values(fallbackTickets)) {
    t.isVictoryEdition = true;
    count++;
  }
  return count;
}
