jquery-binddata
===============

A jquery plugin to facilitate binding of javascript objects to form fields.  This plugin will set the value of form field elements based on the properties of the bound object, and update the bound object when changes are made to the form.

Usage
-----

Binddata expects names of form field elements to match properties in the model.  There is also support for nested properties.
```
var data = {prop1: 'value1', nestedProp: {prop2: 'someval2'}};

<form>
<input type="text" name="prop1" />
<input type="radio" name="nestedProp.prop2" value="someval" />
<input type="radio" name="nestedProp.prop2" value="someval2" />
...
$('form').binddata(data);
```
Will result in the text field's value being set to "value1" and the second radio button being selected.

Binddata, by default, will bind change handlers to all input and select elements within a form to a model.  You can easily retrieve field values by binding and empty, or partially populated model.
```
<form>
<input type="text" name="prop1" />
<input type="text" name="prop2" />
...
var data = {};
$('form').binddata(data);
```
When the values in the text fields change, the data model will be updated accordingly.

Options
-------

A parameter object may optionally be passed to binddata to change the way it works.  These parameters are listed here.
* bindAll - boolean (default true) - If set to false, binddata will only listen for changes in form fields that are contained within the data model.  If other field elements belong to a form, but a property for it did not exist in the model when it was bound, changes to that field will not be reflected in the model.
