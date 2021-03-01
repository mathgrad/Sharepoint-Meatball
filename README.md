<h1>Sharepoint-Meatball</h1>
<dl>
  <h2>
    <dt>Mission Statement</dt>
  </h2>
  <h3>
    <dd>
      Allows users to change color circles (meatballs) through a popover inorder
      to improve work productivity
    </dd>
  </h3>
</dl>
<dl>
  <h3>
    <dt>Execution</dt>
  </h3>
  <h4>
    <dd>
      The meatball script exists on the Sharepoint main page. If you do not see
      the script, then proceed to request it to be added to your organization's
      main page.
    </dd>
    <dd>
      The meatball script requires jquery to run. If you see an error message
      indicating an improperly loaded script, then make sure to request jquery to
      be added to your organization's main page.
    </dd>
  </h4>
  <h3>
    <dt>Features</dt>
  </h3>
  <h4>
    <dd>
      All select list values will be replaced with circles of different colors.
    </dd>
    <dd>
      A popover appears when you mouse over the circle.
    </dd>
    <dd>
      The popover displays the column and row name, all available choices for
      the cell, the currently selected value, the last history change made, and
      a show more button.
    </dd>
    <dd>
      Clicking on any choice will update the list and page in real time.
    </dd>
    <dd>
      Clicking on show more, will open a history panel. It displays all
      historical changes, and comments made for that particular cell. 
    </dd>
    <dd>
      An input area at the bottom of the history panel allows for custom comments to be made.
    </dd>
  </h4>
  <h3>
    <dt>Customizations</dt>
  </h3>
  <dd>
    <ul>
      <li>
        <h4>Colors and Values</h4>
        <h5>
          Meatball recognizes the following by default.
          <ul>
            <li>Up</li>
            <li>Down</li>
            <li>Degraded</li>
            <li>NA</li>
            <li>100-90</li>
            <li>89-79</li>
            <li>79-10</li>
          </ul>
          <br />
          To add custom values:
          <ol>
            <li>
              Add a script editor to the page, or use one on the page.
            </li>
            <li>
              Write the following inside the script editor:
              <br />
              <script>
                <br />
                  var meatball_override = [ <br />
                    { value: "", color: "" }, <br />
                    { value: "", color: "" }, <br />
                  ];
                <br />
              </script>
            </li>
            <li>
              The values must line up with the custom values. The colors can be
              words or # code.
              <a href="http://colorcode.is/">Color Code</a> can be helpful here.
            </li>
            <li>
              Example:<br />
              <script>
                <br />
                              var meatball_override = [<br />
                                { value: "Hi", color: "orange" },<br />
                                { value: "Editor", color: "brown" },<br />
                                { value: "You", color: "black" },<br />
                                { value: "Got", color: "gray" },<br />
                                { value: "This", color: "#ee00ee" },<br />
                              ];<br />
              </script>
            </li>
          </ol>
        </h5>
      </li>
      <li>
        <h4>Ignore Columns</h4>
        <h5>
          To set columns to be ignored:
          <ol>
            <li>
              Add a script editor to the page or use one on the page.
            </li>
            <li>
              Write the following into the script editor
              <script>
                <br />
                var meatball_ignore = [];
                <br />
              </script>
            </li>
            <li>
              Inside of the array, add in the name of the column to be ignored.
            </li>
            <li>
              Example:
              <br />
              Column name: "Test Column"
              <br />
              <script>
                <br />
                var meatball_ignore = ["Test Column"];
                <br />
              </script>
            </li>
          </ol>
        </h5>
      </li>
      <li>
        <h4>Text Columns</h4>
        <h5>
          To set columns to display text instead of a meatball:
          <ol>
            <li>
              Add a script editor to the page or use one on the page.
            </li>
            <li>
              Write the following into the script editor<br />
              <script>
                <br />
                var meatball_text = [];
                <br />
              </script>
            </li>
            <li>
              Inside of the array, add in the name of the column to be ignored.
            </li>
            <li>
              Example:
              <br />
              Column name: "Test Column"
              <br />
              <script>
                <br />
                var meatball_text = ["Test Column"];
                <br />
              </script>
            </li>
          </ol>
        </h5>
      </li>
      <li>
        <h4>Disable Script</h4>
        <h5>
          To disable the script from running:
          <ol>
            <li>
              Add a script editor to the page or use one on the page.
            </li>
            <li>
              Write the following into the script editor<br />
              <script>
                <br />
                var ims_meatball_hide = true;
                <br />
              </script>
            </li>
          </ol>
        </h5>
      </li>
    </ul>
  </dd>
  <h3><dt>Debugging</dt></h3>
  <h4>
    <dd>
      The following should help fix most issues with the script.
      <ol>
        <li>
          Check the page's lists.
        </li>
        <li>
          Check the column names, including the hidden ones.
        </li>
        <li>
          Verify column names haven't been changed.
        </li>
        <li>
          Verify the values in each select column and ensure they match with
          defaults or overrides.
        </li>
        <li>
          Verify the overrides are created correctly.
        </li>
      </ol>
    </dd>
    <dd>
      If error persists, then contact the developers.
      <br />
      At the top of the meatball.js, a variable called debug exists. Toggle it
      to true, and error notifications will pop up containing the error message.
      <br />
      Once finished, toggle it back to false.
    </dd>
  </h4>
</dl>
