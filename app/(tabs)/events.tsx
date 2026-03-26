import { Redirect } from 'expo-router';

/** The events tab was renamed to Announcements. This redirect keeps old deep-links working. */
export default function EventsRedirect() {
  return <Redirect href="/(tabs)/announcements" />;
}
