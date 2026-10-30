const MESSAGES_KEY = 'montano_contact_messages'

export function saveContactMessage(message) {
  const saved = localStorage.getItem(MESSAGES_KEY)
  const messages = saved ? JSON.parse(saved) : []
  if (!Array.isArray(messages)) {
    throw new Error('Saved contact messages have an invalid format.')
  }
  const updatedMessages = [{ id: Date.now(), ...message }, ...messages]
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages))
}
