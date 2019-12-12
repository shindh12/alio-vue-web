<template>
  <span>
    <div class="field">
      <input v-bind:value="value"
             v-on:input="$emit('input', $event.target.value)"
             v-bind:placeholder="placeholder"
             v-bind:class="{ 'error': error }"
             v-on:blur="$emit('blur')"
             v-on:keyup.enter="$emit('enter')">
      <div v-if="checked !== undefined" )
           check-icon(v-show="checked" style="width: 16px; height: 16px;">

      </div>
    <div class="message" v-if="error">{{ error }}</div>
    </div>
  </span>
</template>

<script>
    import CheckIcon from '@/components/icons/CheckIcon';

    export default {
        props: ['value', 'placeholder', 'error', 'checked'],
        components: {
            CheckIcon
        }
    };
</script>

<style scoped>
    span {
        display: inline-block;
    }

    span > .field {
        width: 100%;
        display: inline-flex;
        align-items: center;
    }

    span > .field > input {
        flex: 1 1;
        box-sizing: border-box;
        border: solid 1px rgba(0, 0, 0, 0.2);
        padding: 5px 11px;
        font-size: 12px;
        line-height: 1.5;
        text-align: left;
        color: rgba(0, 0, 0, 0.8);
    }

    span > .field > input::placeholder {
        color: rgba(0, 0, 0, 0.3);
    }

    span > .field > input.error {
        border: solid 1px #ED4839;
    }

    span > .field > input:focus {
        border: solid 1px #2F4FD4;
    }

    span > .field > input + * {
        margin-left: 8px;
        flex: 0 0 16px;
        display: inline-flex;
        align-items: center;
    }

    span > .message {
        position: absolute;
        margin-top: 2px;
        height: 14px;
        line-height: 14px;
        text-align: left;
        color: #ED4839;
    }

</style>
