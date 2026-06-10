import api from './axios'

export async function loginWithGoogle(idToken: string): Promise<{ access_token: string }> {
  const { data } = await api.post<{ access_token: string }>('/auth/google', { id_token: idToken })
  return data
}
