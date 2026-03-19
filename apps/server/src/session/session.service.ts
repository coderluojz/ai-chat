import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SessionService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(userId: string, title?: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: userId, title: title || '新对话' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(userId: string, sessionId: string, title: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('会话不存在');
    }
    return data;
  }

  async remove(userId: string, sessionId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  async getMessages(userId: string, sessionId: string) {
    const supabase = this.supabaseService.getClient();

    // 先验证会话归属
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({ session_id: sessionId, role, content })
      .select()
      .single();

    if (error) throw error;

    // 更新会话的 updated_at
    await supabase
      .from('sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return data;
  }
}
