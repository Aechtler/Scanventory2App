import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateGroupForm } from '../../features/groups/components/CreateGroupForm';
import type { GroupSummary } from '../../features/groups/types/group.types';

export default function CreateGroupScreen() {
  function handleCreated(group: GroupSummary) {
    // Direkt zur neuen Gruppe navigieren
    router.replace(`/groups/${group.id}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <Text className="text-foreground text-lg font-semibold">Gruppe erstellen</Text>
      </View>
      <CreateGroupForm
        onCreated={handleCreated}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}
