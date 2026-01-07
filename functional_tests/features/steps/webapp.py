from behave import when, then
from selenium.webdriver.support.expected_conditions import presence_of_element_located
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from helper.selenium import element_value_is_non_empty

import logging

log = logging.getLogger("webapp")


@when('the webapp URL "{page}" is loaded')
def step_impl(context, page):
    url = "http://{}:{}/{}".format(context.address, context.port, page)
    context.browser.get(url)


@then('the page element with data-testid "{element_id}" should be available')
def step_impl(context, element_id):
    log.debug('waiting for element "{}"'.format(element_id))

    try:
        log.debug('waiting for element "{}"'.format(element_id))
        WebDriverWait(context.browser, 3).until(presence_of_element_located((By.CSS_SELECTOR, '[data-testid="{}"]'.format(element_id))))
    except Exception as e:
        log.error('Element not found: {}'.format(e))
        log.debug('Page source: {}'.format(context.browser.page_source))
        log.debug('Current URL: {}'.format(context.browser.current_url))
        raise

