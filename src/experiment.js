/**
 * @title Test Experiment
 * @description An experiment where i can see how this thing works
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import ImageKeyboardResponsePlugin from "@jspsych/plugin-image-keyboard-response"
import { initJsPsych } from "jspsych";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {


  // // Preload assets
  // timeline.push({
  //   type: PreloadPlugin,
  //   images: assetPaths.images,
  //   audio: assetPaths.audio,
  //   video: assetPaths.video,
  // });

  // // Welcome screen
  // timeline.push({
  //   type: HtmlKeyboardResponsePlugin,
  //   stimulus: "<p>Welcome to Test Experiment!<p/>",
  // });

  // // Switch to fullscreen
  // timeline.push({
  //   type: FullscreenPlugin,
  //   fullscreen_mode: true,
  // });

  // await jsPsych.run(timeline);


  const jsPsych = initJsPsych({

    /** RUN WHEN EXPERIMENT IS DONE */
    on_finish: function() {

      /** DISPLAY THE DATA */
      jsPsych.data.displayData()
    }
  });
  const timeline = [];

  /** PRELOADING MEDIA */
  timeline.push({
    type: PreloadPlugin,
    images: ["assets/imgs/blue.png", "assets/imgs/orange.png"]
  })

  /** KEYBOARD RESPONSE PLUGIN */
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: "<h1>Title</h1>"
  })

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>In this experiment, a circle will appear in the center 
      of the screen.</p><p>If the circle is <strong>blue</strong>, 
      press the letter F on the keyboard as fast as you can.</p>
      <p>If the circle is <strong>orange</strong>, press the letter J 
      as fast as you can.</p>
      <div style='width: 700px;'>
      <div style='float: left;'><img src='assets/imgs/blue.png'></img>
      <p class='small'><strong>Press the F key</strong></p></div>
      <div style='float: right;'><img src='assets/imgs/orange.png'></img>
      <p class='small'><strong>Press the J key</strong></p></div>
      </div>
      <p>Press any key to begin.</p>
    `,
    post_trial_gap: 2000
  })


  /** IMAGE KEYBOARD RESPONSE PLUGIN */
  // timeline.push({
  //   type: ImageKeyboardResponsePlugin,
  //   stimulus: "assets/imgs/blue.png",
  //   choices: ['f', 'j']
  // })

  // timeline.push({
  //   type: ImageKeyboardResponsePlugin,
  //   stimulus: "assets/imgs/orange.png",
  //   choices: ['f', 'j']
  // })

  /** TIMELINE VARIABLES */
  const test_stimuli = [
    { stimulus: "assets/imgs/blue.png", correct_response: 'f' },
    { stimulus: "assets/imgs/orange.png", correct_response: 'j' }
  ]

  const fixationCross = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: "NO_KEYS",

    /** RANDOMIZATION */
    trial_duration: function (){
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]
    },

    data: {
      task: 'fixation'
    }
  }

  const test = {
    type: ImageKeyboardResponsePlugin,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],

    /** EXTRA TAGS FOR PRINTING (FULLY CUSTOME) */
    data: {
      task: 'response',
      correct_response: jsPsych.timelineVariable('correct_response')
    },

    /** PROCESS AFTER EACH TRIAL */
    on_finish: function(result) { 
      //COMPARING KEY PRESSES
      result.correct = jsPsych.pluginAPI.compareKeys(result.response, result.correct_response)

      // COMPARING ANYTHING NOT A KEYBOARD RESPONSE
      // data.correct = data.response === data.correct_response;
    }
  }

  const testProcedure = {
    timeline: [fixationCross, test],
    timeline_variables: test_stimuli,
    randomize_order: true,
    repetitions: 5
  }

  timeline.push(testProcedure)


  /** AGGREGATING RESULTS */
  const debrief_block = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function() {

        const trials = jsPsych.data.get().filter({task: "response"})
        const correct_trials = trials.filter({correct: true})
        const accuracy = Math.round(correct_trials.count() / trials.count() * 100)
        const rt = Math.round(correct_trials.select('rt').mean())

        return (
          `
            <p>You responded correctly on ${accuracy}% of the trials.</p>
            <p>Your average response time was ${rt}ms.</p>
            <p>Press any key to complete the experiment. Thank you!</p>
          `
        )
    }
  }
  timeline.push(debrief_block)


  jsPsych.run(timeline)


  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}
