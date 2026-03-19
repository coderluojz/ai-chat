import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Message, Session } from "../common/interfaces/database.interface";
import { MessageRole } from "../common/enums/message-role.enum";

@Injectable()
export class SessionService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string): Promise<Session[]> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (result.error) throw result.error;
    return (result.data ?? []) as Session[];
  }

  async create(userId: string, title?: string): Promise<Session> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase
      .from("sessions")
      .insert({ user_id: userId, title: title || "新对话" })
      .select()
      .single();

    if (result.error) throw result.error;
    return result.data as Session;
  }

  async update(
    userId: string,
    sessionId: string,
    title: string,
  ): Promise<Session> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase
      .from("sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (result.error || !result.data) {
      throw new NotFoundException("会话不存在");
    }
    return result.data as Session;
  }

  async remove(
    userId: string,
    sessionId: string,
  ): Promise<{ success: boolean }> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (result.error) throw result.error;
    return { success: true };
  }

  async getMessages(userId: string, sessionId: string): Promise<Message[]> {
    const supabase = this.supabaseService.getClient();

    const sessionResult = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (!sessionResult.data) {
      throw new NotFoundException("会话不存在");
    }

    const result = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (result.error) throw result.error;
    return (result.data ?? []) as Message[];
  }

  async addMessage(
    userId: string,
    sessionId: string,
    role: MessageRole,
    content: string,
  ): Promise<Message> {
    const supabase = this.supabaseService.getClient();

    const sessionResult = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (!sessionResult.data) {
      throw new ForbiddenException("无权访问此会话");
    }

    const result = await supabase
      .from("messages")
      .insert({ session_id: sessionId, role, content })
      .select()
      .single();

    if (result.error) throw result.error;

    await supabase
      .from("sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return result.data as Message;
  }

  async verifySessionOwnership(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    return !!result.data;
  }
}
