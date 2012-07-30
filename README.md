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
* onlyGetOrSet - string 'get' | 'set' (default '') - If set to 'get', binddata will populate field data into the model without performing data binding.  If set to 'set', binddata will populate the form from the model without binding data.
* transforms - array of {name: regex, getset: function('get'|'set', value)} (default []) - Provides a list of data transformers to binddata to transform the data from the model to the form, or from the form to the model.  The name property is a regular expression tested against the names of field elements.  All transformers that pass this test will be used to transform the value.  A value from the model will be transformed by taking the returned value from the getset function.  When the getset function is called, it's first parameter will be the string 'set', and the second parameter the value from the model.  Similarly, if a value is being retrieved from the form to be populated in the model, the first parameter to the getset function will be the string 'get', and the second parameter will be the value from the form field element.  If more than one transformer name regex passes the field name test, then they will be called in order, each output providing input to the next getset call, until the final value is retrieved.
