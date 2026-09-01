import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, Text } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs style={styles.tabsRoot}>
      <TabSlot style={styles.tabSlot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Inicio</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Mapa</TabButton>
          </TabTrigger>
          <TabTrigger name="clima" href="/clima" asChild>
            <TabButton>Clima</TabButton>
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton>Perfil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}>
      <View
        style={[
          styles.tabButtonContent,
          isFocused && styles.tabButtonSelected,
        ]}
      >
        <Text style={[styles.tabText, isFocused && styles.tabTextSelected]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.tabListInner}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRoot: {
    flex: 1,
    height: '100%',
  },
  tabSlot: {
    flex: 1,
    height: '100%',
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  tabListInner: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    borderRadius: 16,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  tabButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
});
