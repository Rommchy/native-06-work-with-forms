import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { sendData } from "./services/sendData";
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = useForm({
    defaultValues: {
      nameInputValue: "",
      emailInputValue: "",
      checkInPicker: new Date(),
      checkOutPicker: null,
      selectedValue: "standard",
    },
  });

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.formHeader}>Booking form</Text>
        <Text style={styles.formTitle}>Name</Text>
        <Controller
          control={control}
          name="nameInputValue"
          rules={{
            required: { value: true, message: "Name is required" },
            pattern: {
              value: /^[A-Z].{2,}$/,
              message:
                "Name must start with a capital letter and contain at least 3 characters",
            },
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInput
                testID="user-name-input"
                style={styles.input}
                onChangeText={(text) => {
                  onChange(text);
                  trigger();
                }}
                value={value}
                placeholder="Insert your name..."
              />
            );
          }}
        />
        {errors.nameInputValue && (
          <Text style={styles.errorText}>{errors.nameInputValue.message}</Text>
        )}
        <Text style={styles.formTitle}>email</Text>
        <Controller
          control={control}
          name="emailInputValue"
          rules={{
            required: { value: true, message: "E-mail is required" },
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/,
              message: "Invalid email address. Please enter a valid email",
            },
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <TextInput
                testID="email-input"
                style={styles.input}
                onChangeText={(text) => {
                  onChange(text);
                  trigger();
                }}
                value={value}
                placeholder="Insert your email..."
              />
            );
          }}
        />

        {errors.emailInputValue && (
          <Text style={styles.errorText}>{errors.emailInputValue.message}</Text>
        )}
        <Text style={styles.formTitle}>Check-In Date</Text>
        <Controller
          control={control}
          name="checkInPicker"
          rules={{}}
          render={({ field: { onChange, value } }) => {
            const handleChange = (event, selectedDate) => {
              if (event.type === "dismissed" || !selectedDate) return;
              onChange(selectedDate);
              trigger();
            };

            if (Platform.OS === "ios") {
              return (
                <DateTimePicker
                  testID="date-time-picker"
                  mode="date"
                  style={styles.input}
                  minimumDate={new Date()}
                  value={value}
                  onChange={handleChange}
                />
              );
            }

            return (
              <Pressable
                style={styles.input}
                onPress={() =>
                  DateTimePickerAndroid.open({
                    value,
                    mode: "date",
                    minimumDate: new Date(),
                    onChange: handleChange,
                  })
                }
              >
                <Text>{value.toLocaleDateString("uk-UA")}</Text>
              </Pressable>
            );
          }}
        />
        <Text style={styles.formTitle}>Check-Out Date</Text>
        <Controller
          control={control}
          name="checkOutPicker"
          rules={{
            required: { value: true, message: "Check-Out Date is required" },
            validate: () => {
              const { checkInPicker, checkOutPicker } = getValues();
              const day = (d) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate());
              return (
                day(checkOutPicker) > day(checkInPicker) ||
                "The Check-Out Date must be later than the Check-In Date"
              );
            },
          }}
          render={({ field: { onChange, value } }) => {
            const handleChange = (event, selectedDate) => {
              if (event.type === "dismissed" || !selectedDate) return;
              onChange(selectedDate);
              trigger();
            };

            if (Platform.OS === "ios") {
              return (
                <DateTimePicker
                  testID="date-time-picker"
                  mode="date"
                  style={styles.input}
                  minimumDate={tomorrow}
                  value={value || tomorrow}
                  onChange={handleChange}
                />
              );
            }

            return (
              <Pressable
                style={styles.input}
                onPress={() =>
                  DateTimePickerAndroid.open({
                    value: value || tomorrow,
                    mode: "date",
                    minimumDate: tomorrow,
                    onChange: handleChange,
                  })
                }
              >
                <Text>
                  {value ? value.toLocaleDateString("uk-UA") : "Select date"}
                </Text>
              </Pressable>
            );
          }}
        />
        {errors.checkOutPicker && (
          <Text style={styles.errorText}>{errors.checkOutPicker.message}</Text>
        )}

        <Text style={styles.formTitle}>Choose the room type:</Text>
        <Controller
          control={control}
          name="selectedValue"
          rules={{}}
          render={({ field: { onChange, value } }) => {
            return (
              <Picker
                style={styles.input}
                selectedValue={value}
                onValueChange={(value) => {
                  onChange(value);
                  trigger();
                }}
                value={value}
                // placeholder="choose: Standard/Luxury/Family"
              >
                <Picker.Item label="Standard" value={"standard"} />
                <Picker.Item label="Luxury" value={"luxury"} />
                <Picker.Item label="Family" value={"family"} />
              </Picker>
            );
          }}
        />

        <TouchableOpacity
          style={{ ...styles.button, marginTop: 50 }}
          title="Submit"
          onPress={handleSubmit((formData) => {
            sendData({
              userName: formData.nameInputValue,
              email: formData.emailInputValue,
              roomType: formData.selectedValue,
              checkInDate: formData.checkInPicker,
              checkOutDate: formData.checkOutPicker,
            });
            reset();
          })}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    width: "100%",
    maxWidth: 600,
  },
  button: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  formHeader: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 4,
  },
  errorText: {
    color: "red",
  },
});
