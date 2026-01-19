import { Checkbox } from "@/components/checkbox";
import { DraggableSlider } from "@/components/draggable-slider";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FlashAlarmScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function FlashAlarmScreen({
    visible,
    onClose,
}: FlashAlarmScreenProps) {
    const [checked, setChecked] = useState(true);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.bottomSheet}>

                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Báo thức nhanh</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content1}>
                        <TouchableOpacity>
                            <Ionicons name="add-outline" size={24} style={{ color: "#FFFFFF" }} />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 50, fontWeight: 700, color: "#FFFFFF" }}>
                            0
                        </Text>

                        <Text style={{ fontSize: 40, color: "#FFFFFF" }}>
                            phút
                        </Text>

                        <TouchableOpacity>
                            <Ionicons name="reload-outline" size={24} style={{ color: "#FFFFFF" }} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: "#FFFFFF", textAlign: "center", fontSize: 20, marginBottom: 20 }}>
                        Đổ chuông lúc 11:01 CH
                    </Text>

                    <View style={styles.content2}>
                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                1 phút
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                5 phút
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                10 phút
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content2}>
                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                15 phút
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                30 phút
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.timeCard}>
                            <Text style={styles.timeText}>
                                1 giờ
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.content3}>
                        <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>
                            Âm thanh
                        </Text>

                        <View style={styles.subContent3}>
                            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>
                                Orkney
                            </Text>

                            <Ionicons name="chevron-forward-outline" size={24} style={{ color: "#FFFFFF" }} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.content4}>
                        <Ionicons name="volume-medium-outline" size={24} style={{ color: "#FFFFFF" }} />

                        <DraggableSlider />

                        <TouchableOpacity style={styles.subContent4}>
                            <MaterialIcons name="vibration" size={24} color="#fff" style={{ paddingRight: 10 }} />

                            <Checkbox checked={checked} onChange={setChecked} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveBtn}>
                        <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 700 }}>
                            Lưu
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    bottomSheet: {
        height: '70%',
        backgroundColor: '#1a202c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },

    sheetHeader: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },

    sheetTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    closeButton: {
        position: 'absolute',
        right: 16,
    },

    content1: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 100,
        paddingRight: 100,
        marginTop: 50
    },

    content2: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10
    },

    timeCard: {
        height: 50,
        width: 110,
        backgroundColor: "#3e3a3a",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },

    timeText: {
        color: "#FFFFFF",
        fontSize: 20
    },

    content3: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20
    },
    
    subContent3: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    content4: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20
    },

    subContent4: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    saveBtn: {
        backgroundColor: "#da1717",
        borderRadius: 20,
        height: 50,
        alignItems: "center",
        marginHorizontal: 20,
        justifyContent: "center",
        marginTop: 40
    }
})
