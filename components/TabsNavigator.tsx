import { View, Text, TouchableOpacity } from "react-native";
import { Link, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { Home, FilePlus2, Settings, Images} from "lucide-react-native";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export default function TabsNavigator() {
  const pathname = usePathname();
  const { theme } = useContext(ThemeContext);

  const tabs: { name: string; href: Href; icon: any }[] = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Crear", href: "/create", icon: FilePlus2 },
    { name: "Ajustes", href: "/auth/settings", icon: Settings },
    { name: "Galeria", href: "/GaleryImages", icon: Images },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.text + "33", // ligera transparencia para borde
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      {tabs.map(({ name, href, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link key={name} href={href} asChild>
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={26} color={active ? theme.primary : theme.text + "99"} />
              <Text
                style={{
                  color: active ? theme.primary : theme.text + "99",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {name}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}
