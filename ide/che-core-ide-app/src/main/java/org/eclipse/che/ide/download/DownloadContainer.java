/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
package org.eclipse.che.ide.download;

import com.google.gwt.user.client.ui.Frame;
import com.google.gwt.user.client.ui.RootLayoutPanel;
import com.google.inject.Inject;
import com.google.inject.Singleton;

/**
 * The purpose of this class is avoid opening a new window when downloading
 *
 * @author Roman Nikitenko
 */
@Singleton
public class DownloadContainer {
  private static final String TARGET = "download-frame";

  private Frame frame;

  @Inject
  public DownloadContainer() {
    frame = new Frame();
    frame.getElement().setAttribute("name", TARGET);
    frame.setSize("0px", "0px");
    frame.setVisible(false);
    frame.ensureDebugId(TARGET);

    RootLayoutPanel.get().add(frame);
  }

  /**
   * Sets the URL of the resource to be downloaded.
   *
   * @param url the resource's new URL
   */
  public void setUrl(String url) {
    frame.setUrl(url);
  }
}
