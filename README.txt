// $Id$

CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Installation
 * Known Issues
 * More Information


INTRODUCTION
------------

Current Maintainer: Corey Slavnik <corey@coreyslavnik.com>

Voyeur is a web-based text analysis environment. It is designed to be user-friendly,
flexible and powerful. Voyeur is part of the Hermeneuti.ca, a collaborative project to develop
and theorize text analysis tools and text analysis rhetoric.

The Voyeur module for Drupal allows users to implement the power of Voyeur to analyze or
"reveal" nodes within your Drupal website.

The actual tool can be found here: http://voyeurtools.org/.


INSTALLATION
------------

See http://drupal.org/getting-started/6 for instructions on
how to install or update Drupal modules.

Once Voyeur is enabled after installation, you may add it as a block to your Drupal website.
This allows a visualization to appear within your block, which can be configured via the Voyeur
admin options. (Administer > Site configuration > Voyeur module settings) The module settings
screen allows you to choose specific block settings and filtering options for your users.


KNOWN ISSUES
------------

- If the Taxonomy module is enabled, filtering by terms which have encoded characters (such as '&' or '#')
  will not filter properly. This is not a security risk, but just an annoyance.

- Analysis of nodes which contain HTML tags (even unparsed tags) will be stripped when analyzed by Voyeur.


MORE INFORMATION
----------------

- To issue any bug reports, feature or support requests, see the module issue
  queue at http://drupal.org/project/issues/voyeur.

- For Voyeur documentation, see the official website at http://hermeneuti.ca/voyeur.
