<template>
  <q-btn
    :color="buttonColor"
    :icon="buttonIcon"
    :class="customClass"
    @click="onClick"
  >
    <slot></slot>
  </q-btn>
</template>

<script>
import { computed, defineComponent, toRefs } from "vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      required: true, // "edit", "save", "delete"
    },
    customClass: {
      type: String,
      default: "",
    },
  },
  emits: ["click"],
  setup(props, { emit }) {
    const { type } = toRefs(props);

    const buttonColor = computed(() => {
      return {
        edit: "primary",
        save: "primary",
        delete: "negative",
      }[type.value];
    });

    const buttonIcon = computed(() => {
      return {
        edit: "edit",
        save: "save",
        delete: "delete",
      }[type.value];
    });

    const onClick = () => {
      emit("click");
    };

    return {
      buttonColor,
      buttonIcon,
      onClick,
    };
  },
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px; 
}

.action-buttons q-btn {
  border-radius: 8px; 
  padding: 8px 12px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  transition: transform 0.2s, box-shadow 0.2s; 
}

.action-buttons q-btn:hover {
  transform: scale(1.1); 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
}

.action-buttons q-btn:active {
  transform: scale(0.95); 
  box-shadow: none; 
}

.edit-btn {
  background-color: var(--q-secondary); 
  color: white; 
}

.save-btn {
  background-color: var(--q-primary); 
  color: white;
}

.remove-btn {
  background-color: var(--q-negative); 
  color: white;
}

.remove-btn:hover {
  background-color: darkred; 
}
</style>
