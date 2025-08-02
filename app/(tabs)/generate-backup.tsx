import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View } from "react-native";

export default function GenerateScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <ThemedText type="title">Generate Quotes</ThemedText>
            <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                This is a simplified version to test for prototype errors.
            </ThemedText>
        </View>
    );
}