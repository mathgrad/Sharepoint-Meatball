<h1>IMS - Meatball Solution</h1>
<dl>
  <h2>
    <dt>Mission Statement</dt>
  </h2>
  <h3>
    <dd>
      Enable users to rapidy update and visualize a field status to affect decision making within an organization.
    </dd>
  </h3>
</dl>
<dl>
  <h3>
    <dt>Execution</dt>
  </h3>
  <h4>
    <dd>
      The IMS - Meatball solution deploys through the site collection's master page.  Thus all pages natively run the solution.
    </dd>
    <dd>
      The runtime enviornment requires jQuery, specifically Ajax, to function.  Most DoD SharePoint environments load jQuery to support other solutions.  Please edit the master page to confirm its reference.
    </dd>
  </h4>
  <h3>
    <dt>Features</dt>
  </h3>
  <h4>
    <dd>
      <ul>
        <li>
        All select list values, by default, will be replaced with circles of different colors. ![Test](./dist/media/basic.png)
        </li>
        <li>
         A popover appears when you mouse over the circle.  
        </li>
        <li>
             The popover displays the column and row name, all available choices for
      the cell, the currently selected value, the last history change made, and
      a show more button.
        </li>
        <li>
             Clicking on any choice will update the list and page in real time.
        </li>
        <li>
              Clicking on show more, will open a history panel. It displays all
      historical changes, and comments made for that particular cell. 
        </li>
        <li>
         An input area at the bottom of the history panel allows for custom comments to be made.
        </li>
      </ul>  
    </dd>
  </h4>
  <h3>
    <dt>Customizations</dt>
  </h3>
  <dd>
    <ul>
      <li>
        <h4>Defaults</h4>
        <h5>
          The script will replace text in any select list with a circle of a known color.  <br />
          If the text isn't a default value, then a circle of the background color will appear.  <br />
          The default values are:
          <ul>
            <li>Up => Green</li>
            <li>Down => Red</li>
            <li>Degraded => Yellow</li>
            <li>NA => Black</li>
            <li>100-90 => Green</li>
            <li>89-79 => Yellow</li>
            <li>79-10 => Red</li>
            <li><79 => Red</li>
            <li><10 => Blue</li>
          </ul>
        </h5>
      </li>
      <li>
        <h4>Colors and Values</h4>
        <h5>
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
      <ol>
        <li>
          Add a script editor to the page or use one on the page.
        </li>
        <li>
          Write the following into the script editor<br />
          <script>
            <br />
            var meatball_debug = true;
            <br />
          </script>
          <br />
          Now, any error will appear on a notification design to remain on the page no matter what.
        </li>
        <li>
          To turn off debug mode, either delete { var meatball_debug = true; } or change it to { var meatball_debug = false }
        </li>
      </ol>
    </dd>
  </h4>
</dl>
