<template>
  <div id="app">
    <AppMain/>
  </div>
</template>

<script>
  import AppMain from '@/components/AppMain'

  export default {
    name: 'App',
    components: {
      AppMain
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /* margin-top: 60px; */
    height: 100%;
  }

  body {
    margin: 0;
    height: 100vh;
    /*font-family: 'Lacquer', sans-serif;*/
    /*font-family: 'Eater', cursive;*/
    /*font-family: 'Homemade Apple', cursive;*/
    /*font-family: 'Freckle Face', cursive;*/
    /*font-family: 'Frijole', cursive;*/
    /*font-family: 'Nosifer', cursive;*/
  }
</style>
